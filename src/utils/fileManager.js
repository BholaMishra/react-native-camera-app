import RNFS from 'react-native-fs';
import {Platform, PermissionsAndroid} from 'react-native';
import {STORAGE_KEYS} from './constants';
import {CameraRoll} from '@react-native-camera-roll/camera-roll'; // FIXED: Correct import

export const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        // Android 13+ - Request media permissions
        const granted = await PermissionsAndroid.requestMultiple([
          'android.permission.READ_MEDIA_IMAGES',
          'android.permission.READ_MEDIA_VIDEO',
        ]);
        
        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs storage permission to save videos to gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Storage permission error:', err);
      return false;
    }
  }
  return true;
};

export const getVideoFolderPath = () => {
  const basePath = Platform.OS === 'android' 
    ? RNFS.DocumentDirectoryPath
    : RNFS.DocumentDirectoryPath;
  
  return `${basePath}/${STORAGE_KEYS.VIDEO_FOLDER}`;
};

export const ensureVideoFolderExists = async () => {
  try {
    const folderPath = getVideoFolderPath();
    const exists = await RNFS.exists(folderPath);
    
    if (!exists) {
      await RNFS.mkdir(folderPath);
    }
    
    return folderPath;
  } catch (error) {
    console.log('Error creating video folder:', error);
    throw error;
  }
};

export const saveVideoToGallery = async (sourcePath, metadata) => {
  try {
    console.log('=== STARTING VIDEO SAVE PROCESS ===');
    console.log('Source path:', sourcePath);
    
    // Check if source file exists
    const sourceExists = await RNFS.exists(sourcePath);
    console.log('Source file exists:', sourceExists);
    
    if (!sourceExists) {
      throw new Error('Source video file not found at: ' + sourcePath);
    }
    
    // Check file size
    const fileStats = await RNFS.stat(sourcePath);
    console.log('File size:', formatFileSize(fileStats.size));
    
    // Request storage permission
    console.log('Requesting storage permissions...');
    const hasPermission = await requestStoragePermission();
    console.log('Storage permission granted:', hasPermission);
    
    if (!hasPermission && Platform.OS === 'android' && Platform.Version < 33) {
      throw new Error('Storage permission denied');
    }
    
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const fileName = `CameraApp_${timestamp}.mp4`;
    
    console.log('Attempting to save to camera roll...');
    
    try {
      // FIXED: Use correct CameraRoll.save method
      const saveResult = await CameraRoll.save(sourcePath, {
        type: 'video',
        album: 'CameraApp', // This will create an album named "CameraApp"
      });
      
      console.log('✅ SUCCESS: Video saved to camera roll:', saveResult);
      
      // Also save to app directory for backup
      const folderPath = await ensureVideoFolderExists();
      const appPath = `${folderPath}/${fileName}`;
      await RNFS.copyFile(sourcePath, appPath);
      
      // Save metadata
      const metadataPath = appPath.replace('.mp4', '_metadata.json');
      await RNFS.writeFile(metadataPath, JSON.stringify({
        ...metadata,
        originalPath: sourcePath,
        galleryPath: saveResult,
        savedAt: new Date().toISOString(),
        fileSize: fileStats.size,
      }, null, 2));
      
      console.log('✅ Video successfully saved to both gallery and app folder');
      return saveResult;
      
    } catch (cameraRollError) {
      console.error('❌ Camera roll save failed:', cameraRollError);
      
      // Fallback: Save to app directory only
      const folderPath = await ensureVideoFolderExists();
      const destinationPath = `${folderPath}/${fileName}`;
      
      await RNFS.copyFile(sourcePath, destinationPath);
      
      // Save metadata
      const metadataPath = destinationPath.replace('.mp4', '_metadata.json');
      await RNFS.writeFile(metadataPath, JSON.stringify({
        ...metadata,
        originalPath: sourcePath,
        savedAt: new Date().toISOString(),
        fileSize: fileStats.size,
        note: 'Saved to app folder only due to gallery permission issue',
      }, null, 2));
      
      console.log('⚠️ Video saved to app folder only:', destinationPath);
      return destinationPath;
    }
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR saving video:', error);
    throw new Error(`Failed to save video: ${error.message}`);
  }
};

export const getVideoFiles = async () => {
  try {
    const folderPath = getVideoFolderPath();
    const exists = await RNFS.exists(folderPath);
    
    if (!exists) {
      return [];
    }
    
    const files = await RNFS.readDir(folderPath);
    const videoFiles = files.filter(file => 
      file.name.endsWith('.mp4') && file.isFile()
    );
    
    return videoFiles.map(file => ({
      path: file.path,
      name: file.name,
      size: file.size,
      modificationTime: file.mtime,
    }));
  } catch (error) {
    console.log('Error getting video files:', error);
    return [];
  }
};

export const deleteVideoFile = async (filePath) => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      
      // Also delete metadata file if exists
      const metadataPath = filePath.replace('.mp4', '_metadata.json');
      const metadataExists = await RNFS.exists(metadataPath);
      if (metadataExists) {
        await RNFS.unlink(metadataPath);
      }
    }
    return true;
  } catch (error) {
    console.log('Error deleting video file:', error);
    return false;
  }
};

export const cleanupOldVideos = async (maxAgeDays) => {
  try {
    const videoFiles = await getVideoFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    let deletedCount = 0;
    
    for (const file of videoFiles) {
      if (new Date(file.modificationTime) < cutoffDate) {
        const success = await deleteVideoFile(file.path);
        if (success) {
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old video files`);
    }
    
    return deletedCount;
  } catch (error) {
    console.log('Error cleaning up old videos:', error);
    return 0;
  }
};

export const getVideoFolderSize = async () => {
  try {
    const videoFiles = await getVideoFiles();
    return videoFiles.reduce((total, file) => total + file.size, 0);
  } catch (error) {
    console.log('Error calculating folder size:', error);
    return 0;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};