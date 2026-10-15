import { Toast } from '@darkroom/ui';

interface CopyToastProps {
    copied: boolean;
    copyError: boolean;
    fading: boolean;
}

export function CopyToast({ copied, copyError, fading }: CopyToastProps) {
    if (copied) return <Toast message="데이터가 클립보드에 복사되었습니다." fading={fading} />;
    if (copyError)
        return (
            <Toast
                tone="error"
                message="복사에 실패했습니다. 브라우저가 지원하지 않을 수 있습니다."
                fading={fading}
            />
        );
    return null;
}
