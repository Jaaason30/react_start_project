import { launchImageLibrary, launchCamera, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';

export const selectFromGallery = (onSuccess: (images: string[]) => void) => {
  const options: ImageLibraryOptions = {
    selectionLimit: 0,  // 0 = unlimited
    mediaType: 'photo',
  };
  
  launchImageLibrary(options, response => {
    if (response.didCancel) return;
    if (response.errorCode) {
      console.error(response.errorMessage);
      return;
    }
    const uris = response.assets?.map(a => a.uri).filter(Boolean) as string[];
    if (uris.length > 0) {
      onSuccess(uris);
    }
  });
};

export const takePhoto = (onSuccess: (image: string) => void) => {
  const options: CameraOptions = {
    mediaType: 'photo',
  };
  
  launchCamera(options, response => {
    if (response.didCancel) return;
    if (response.errorCode) {
      console.error(response.errorMessage);
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (uri) {
      onSuccess(uri);
    }
  });
};