import { Toast as ToastView } from '@darkroom/ui';
import { useToastStore } from '../store/useToastStore';

export function Toast() {
    const { message, type, hide } = useToastStore();

    if (!message) return null;

    return <ToastView message={message} tone={type} onClose={hide} />;
}
