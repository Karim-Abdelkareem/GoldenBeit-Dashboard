/**
 * Utility functions for handling image uploads
 */

export interface ImageUploadResult {
  name: string;
  extension: string;
  data: string; // Full data URI format: data:image/<type>,<data>
  preview: string; // Full data URI for preview
}

/**
 * Converts a File object to the required image upload format
 * @param file - The file to convert
 * @returns Promise<ImageUploadResult> - Object containing name, extension, data (full data URI), and preview
 */
export function processImageFile(file: File): Promise<ImageUploadResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUri = reader.result as string;
      
      // Extract file extension
      const fileExtension = file.name.split('.').pop() || '';
      const extension = fileExtension ? `.${fileExtension}` : '';
      const fileName = file.name.replace(`.${fileExtension}`, '');

      resolve({
        name: fileName,
        extension: extension,
        data: dataUri, // Full data URI format: data:image/<type>,<data>
        preview: dataUri, // Same for preview
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Processes image file from HTMLInputElement
 * @param input - HTMLInputElement containing the file
 * @returns Promise<ImageUploadResult | null> - Image data or null if no file selected
 */
export function processImageInput(input: HTMLInputElement): Promise<ImageUploadResult | null> {
  return new Promise((resolve, reject) => {
    if (!input.files || !input.files[0]) {
      resolve(null);
      return;
    }

    processImageFile(input.files[0])
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

/**
 * Processes image file from FileList
 * @param fileList - FileList from input element
 * @param index - Index of file to process (default: 0)
 * @returns Promise<ImageUploadResult | null> - Image data or null if no file at index
 */
export function processImageFromFileList(
  fileList: FileList | null,
  index: number = 0
): Promise<ImageUploadResult | null> {
  return new Promise((resolve, reject) => {
    if (!fileList || !fileList[index]) {
      resolve(null);
      return;
    }

    processImageFile(fileList[index])
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

/**
 * Extracts image type from data URI
 * @param dataUri - Data URI string
 * @returns string - Image type (e.g., 'png', 'jpg', 'jpeg')
 */
export function getImageTypeFromDataUri(dataUri: string): string {
  const match = dataUri.match(/data:image\/(.+?);/);
  return match ? match[1] : '';
}

/**
 * Clears/resets image data
 * @returns ImageUploadResult - Empty image object
 */
export function getEmptyImageData(): ImageUploadResult {
  return {
    name: '',
    extension: '',
    data: '',
    preview: '',
  };
}

