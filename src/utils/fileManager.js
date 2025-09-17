import RNFS from 'react-native-fs';
import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {STORAGE_KEYS} from './constants';
import * as CameraRoll from "@react-native-camera-roll/camera-roll";

export const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        // Android 13+ uses READ_MEDIA_VIDEO permission
        const granted = await PermissionsAndroid.request(
          'android.permission.READ_MEDIA_VIDEO',
          {
            title: 'Media Permission',
            message: 'This app needs media permission to save videos to gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.Version >= 30) {
        // Android 10-12 uses scoped storage, no WRITE_EXTERNAL_STORAGE needed
        return true;
      } else {
        // Android 9 and below
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
    console.log('Starting video save process...');
    console.log('Source path:', sourcePath);
    
    // Check if source file exists
    const sourceExists = await RNFS.exists(sourcePath);
    if (!sourceExists) {
      throw new Error('Source video file not found');
    }

    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const fileName = `CameraApp_${timestamp}.mp4`;
    
    // First, copy to a temporary accessible location
    const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await RNFS.copyFile(sourcePath, tempPath);
    
    try {
      console.log('Saving to camera roll from temp path:', tempPath);
      
      // Save to camera roll with proper options
      const saveResult = await CameraRoll.save(`file://${tempPath}`, {
        type: 'video',
        album: 'CameraApp Videos', // This creates a specific album
      });
      
      console.log('Camera roll save result:', saveResult);
      
      // Also save to app directory for backup and metadata
      const folderPath = await ensureVideoFolderExists();
      const appPath = `${folderPath}/${fileName}`;
      await RNFS.copyFile(sourcePath, appPath);
      
      // Save metadata
      const metadataPath = appPath.replace('.mp4', '_metadata.json');
      await RNFS.writeFile(metadataPath, JSON.stringify({
        ...metadata,
        originalPath: sourcePath,
        savedToGallery: true,
        galleryPath: saveResult,
        savedAt: new Date().toISOString(),
      }, null, 2));
      
      // Clean up temp file
      try {
        await RNFS.unlink(tempPath);
      } catch (cleanupError) {
        console.log('Temp file cleanup error (non-critical):', cleanupError);
      }
      
      console.log('Video saved successfully to gallery and app folder');
      return saveResult;
      
    } catch (cameraRollError) {
      console.log('Camera roll failed, trying alternative method:', cameraRollError);
      
      // Clean up temp file on error
      try {
        await RNFS.unlink(tempPath);
      } catch (cleanupError) {
        console.log('Temp file cleanup error:', cleanupError);
      }
      
      // Alternative approach for older Android versions or when CameraRoll fails
      if (Platform.OS === 'android') {
        try {
          // For Android, try saving to Movies/CameraApp folder
          const moviesPath = `${RNFS.ExternalStorageDirectoryPath}/Movies/CameraApp`;
          
          // Create Movies/CameraApp directory
          const moviesDirExists = await RNFS.exists(moviesPath);
          if (!moviesDirExists) {
            await RNFS.mkdir(moviesPath);
          }
          
          const publicPath = `${moviesPath}/${fileName}`;
          await RNFS.copyFile(sourcePath, publicPath);
          
          // Notify Android media scanner about the new file
          if (Platform.OS === 'android') {
            try {
              // Use intent to scan the file
              const MediaScannerConnection = require('react-native').NativeModules.MediaScannerConnection;
              if (MediaScannerConnection) {
                MediaScannerConnection.scanFile(publicPath);
              }
            } catch (scanError) {
              console.log('Media scanner error (non-critical):', scanError);
            }
          }
          
          // Also save to app directory for backup
          const folderPath = await ensureVideoFolderExists();
          const appPath = `${folderPath}/${fileName}`;
          await RNFS.copyFile(sourcePath, appPath);
          
          // Save metadata
          const metadataPath = appPath.replace('.mp4', '_metadata.json');
          await RNFS.writeFile(metadataPath, JSON.stringify({
            ...metadata,
            originalPath: sourcePath,
            savedToGallery: false,
            publicPath: publicPath,
            savedAt: new Date().toISOString(),
            method: 'alternative',
          }, null, 2));
          
          console.log('Video saved to public Movies folder:', publicPath);
          return publicPath;
          
        } catch (alternativeError) {
          console.log('Alternative save method also failed:', alternativeError);
          throw new Error(`All save methods failed. Camera Roll: ${cameraRollError.message}, Alternative: ${alternativeError.message}`);
        }
      } else {
        // For iOS, if CameraRoll fails, there's not much we can do
        throw cameraRollError;
      }
    }
    
  } catch (error) {
    console.error('Error saving video:', error);
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