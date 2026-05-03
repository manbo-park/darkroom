import { Dropzone } from './components/Dropzone';
import { FrameTable } from './components/FrameTable';
import { BulkEditBar } from './components/BulkEditBar';
import { SidePanel } from './components/SidePanel';
import { Toast } from './components/Toast';
import { useFrameStore } from './store/useFrameStore';

function App() {
    const frames = useFrameStore((s) => s.frames);
    const selectedIds = useFrameStore((s) => s.selectedIds);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Fixif</h1>
            </header>
            <main className="max-w-screen-2xl mx-auto p-6 space-y-4">
                <Dropzone />
                {frames.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3 text-sm text-gray-500">
                            <span>{frames.length}개 프레임</span>
                            {selectedIds.size > 0 && (
                                <span className="text-blue-600 font-medium">{selectedIds.size}개 선택됨</span>
                            )}
                            <span className="text-xs text-gray-400">행 클릭 시 편집</span>
                        </div>
                        <BulkEditBar />
                        <FrameTable />
                    </div>
                )}
            </main>
            <SidePanel />
            <Toast />
        </div>
    );
}

export default App;
