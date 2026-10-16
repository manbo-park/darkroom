import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { FrameTable } from './components/FrameTable';
import { FrameToolbar } from './components/FrameToolbar';
import { BulkEditPanel } from './components/BulkEditPanel';
import { SidePanel } from './components/SidePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { Toast } from './components/Toast';
import { ClipboardImportModal } from './components/ClipboardImportModal';
import { useFrameStore } from './store/useFrameStore';
import { useSettingsStore } from './store/useSettingsStore';
import { decodeFiloPayload } from '@darkroom/filo-payload';

function App() {
    const frames = useFrameStore((s) => s.frames);
    const setPendingImport = useFrameStore((s) => s.setPendingImport);
    const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const target = e.target as Element;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

            const text = e.clipboardData?.getData('text');
            if (!text) return;

            const payload = await decodeFiloPayload(text);
            if (payload) setPendingImport(payload);
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [setPendingImport]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!(e.metaKey || e.ctrlKey) || e.key !== 'z') return;
            const target = e.target as Element;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
            e.preventDefault();
            if (e.shiftKey) {
                useFrameStore.getState().redo();
            } else {
                useFrameStore.getState().undo();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="min-h-screen">
            <header className="h-14 border-b border-film-border px-6 flex items-center justify-between">
                <h1 className="text-film-text font-mono font-semibold tracking-wider text-sm">
                    fixif
                </h1>
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="p-1 text-film-muted hover:text-film-text transition-colors"
                    title="설정"
                >
                    <Settings size={20} />
                </button>
            </header>
            <main className="max-w-screen-2xl mx-auto p-6 space-y-4">
                <Dropzone />
                {frames.length > 0 && (
                    <div className="bg-film-surface rounded-xl border border-film-border overflow-hidden">
                        <FrameToolbar />
                        <FrameTable />
                    </div>
                )}
            </main>
            <SidePanel />
            <BulkEditPanel />
            <SettingsPanel />
            <ClipboardImportModal />
            <Toast />
        </div>
    );
}

export default App;
