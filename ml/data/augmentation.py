import cv2
import numpy as np
from PIL import Image
import random
from typing import List, Tuple
import os

class ReceiptAugmentor:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def augment_image(self, image_path: str, num_augmentations: int = 5) -> List[str]:
        original_image = cv2.imread(image_path)
        augmented_paths = []

        for i in range(num_augmentations):
            augmented = original_image.copy()

            # Randomly apply augmentations
            if random.random() > 0.5:
                augmented = self._add_noise(augmented)
            if random.random() > 0.5:
                augmented = self._adjust_brightness(augmented)
            if random.random() > 0.5:
                augmented = self._adjust_contrast(augmented)
            if random.random() > 0.5:
                augmented = self._blur(augmented)
            if random.random() > 0.5:
                augmented = self._perspective_transform(augmented)

            # Save augmented image
            output_path = os.path.join(
                self.output_dir,
                f"aug_{i}_{os.path.basename(image_path)}"
            )
            cv2.imwrite(output_path, augmented)
            augmented_paths.append(output_path)

        return augmented_paths

    def _add_noise(self, image: np.ndarray) -> np.ndarray:
        noise = np.random.normal(0, 25, image.shape).astype(np.uint8)
        return cv2.add(image, noise)

    def _adjust_brightness(self, image: np.ndarray) -> np.ndarray:
        brightness = random.uniform(0.5, 1.5)
        return cv2.convertScaleAbs(image, alpha=brightness, beta=0)

    def _adjust_contrast(self, image: np.ndarray) -> np.ndarray:
        contrast = random.uniform(0.5, 1.5)
        return cv2.convertScaleAbs(image, alpha=contrast, beta=0)

    def _blur(self, image: np.ndarray) -> np.ndarray:
        kernel_size = random.choice([3, 5, 7])
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)

    def _perspective_transform(self, image: np.ndarray) -> np.ndarray:
        height, width = image.shape[:2]
        
        # Define source points (original image corners)
        src_points = np.float32([
            [0, 0],
            [width - 1, 0],
            [0, height - 1],
            [width - 1, height - 1]
        ])

        # Define destination points with random perspective
        max_offset = min(width, height) * 0.1
        dst_points = np.float32([
            [random.uniform(-max_offset, max_offset), random.uniform(-max_offset, max_offset)],
            [width - 1 + random.uniform(-max_offset, max_offset), random.uniform(-max_offset, max_offset)],
            [random.uniform(-max_offset, max_offset), height - 1 + random.uniform(-max_offset, max_offset)],
            [width - 1 + random.uniform(-max_offset, max_offset), height - 1 + random.uniform(-max_offset, max_offset)]
        ])

        # Calculate perspective transform matrix
        matrix = cv2.getPerspectiveTransform(src_points, dst_points)
        
        # Apply perspective transform
        return cv2.warpPerspective(image, matrix, (width, height))

    def create_training_dataset(self, input_dir: str, num_augmentations: int = 5) -> None:
        for filename in os.listdir(input_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(input_dir, filename)
                self.augment_image(image_path, num_augmentations)

def preprocess_receipt(image_path: str) -> np.ndarray:
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh)
    
    return denoised

def create_synthetic_receipt(
    text: str,
    output_path: str,
    font_scale: float = 1.0,
    background_color: Tuple[int, int, int] = (255, 255, 255),
    text_color: Tuple[int, int, int] = (0, 0, 0)
) -> None:
    # Create a blank image
    image = np.ones((800, 600, 3), dtype=np.uint8) * np.array(background_color, dtype=np.uint8)
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    position = (50, 50)
    
    for line in text.split('\n'):
        cv2.putText(
            image,
            line,
            position,
            font,
            font_scale,
            text_color,
            2,
            cv2.LINE_AA
        )
        position = (position[0], position[1] + 40)
    
    # Save the image
    cv2.imwrite(output_path, image) 