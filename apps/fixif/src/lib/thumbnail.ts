const MAX_THUMB_SIZE = 120;

export function generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > MAX_THUMB_SIZE) {
                    height = Math.round((height * MAX_THUMB_SIZE) / width);
                    width = MAX_THUMB_SIZE;
                }
            } else {
                if (height > MAX_THUMB_SIZE) {
                    width = Math.round((width * MAX_THUMB_SIZE) / height);
                    height = MAX_THUMB_SIZE;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('이미지 로드 실패'));
        };
        img.src = url;
    });
}
