import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from './userService';

/**
 * Request permissions for accessing the camera roll
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Request permissions for accessing the camera
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick an image from the device's media library
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    // No permissions request is necessary for launching the image library on newer versions
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    console.log('Image picker result:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return null;
  }
};

/**
 * Take a photo using the device's camera
 */
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Request camera permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera permissions to take a photo');
      return null;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    console.log('Camera result:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Upload an image to Firebase Storage and return the download URL
 */
export const uploadImageAsync = async (uri: string, userId: string): Promise<string | null> => {
  try {
    // Convert image URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a unique filename with timestamp
    const filename = `profile_${userId}_${Date.now()}`;
    const storageRef = ref(storage, `profile_images/${filename}`);
    
    // Upload the blob
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // You can track upload progress here if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors during upload
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadImageAsync:', error);
    return null;
  }
};

/**
 * Update user profile with a new photo
 */
export const updateProfilePhoto = async (userId: string, photoSource: 'gallery' | 'camera'): Promise<boolean> => {
  try {
    // Pick an image or take a photo
    const imageUri = photoSource === 'gallery' 
      ? await pickImageFromGallery() 
      : await takePhoto();
    
    if (!imageUri) {
      console.log('No image selected');
      return false;
    }
    
    // Upload the image and get the URL
    const photoURL = await uploadImageAsync(imageUri, userId);
    
    if (!photoURL) {
      console.error('Failed to upload image');
      return false;
    }
    
    // Update the user profile with the new photo URL
    const success = await updateUserProfile(userId, { photoURL });
    return success;
    
  } catch (error) {
    console.error('Error updating profile photo:', error);
    return false;
  }
};

// Default export to satisfy Expo Router
const imagePickerService = {
  requestMediaLibraryPermissions,
  requestCameraPermissions,
  pickImageFromGallery,
  takePhoto,
  uploadImageAsync,
  updateProfilePhoto
};

export default imagePickerService; 