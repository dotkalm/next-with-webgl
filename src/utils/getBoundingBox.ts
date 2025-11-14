import { 
    type BoundingBox,
    type CarDetection,
} from '@/types';

export const getBoundingBoxes = (detections: CarDetection[]): BoundingBox[] => {
    const boxes: BoundingBox[] = [];
    detections.forEach(({ wheels }) => {
        wheels.forEach(({ confidence, bbox }) => {
            if (confidence > 0.5) {
                boxes.push(bbox);
            }
        });
    });
    return boxes;
}