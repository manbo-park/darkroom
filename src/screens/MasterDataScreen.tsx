import { useState } from 'react';
import { PlusCircle, Trash2, AlertTriangle } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { FilmRow } from '@/components/master/FilmRow';
import { CameraRow } from '@/components/master/CameraRow';
import { LensRow } from '@/components/master/LensRow';
import {
    MasterDataFormModal,
    type MasterFormData,
} from '@/components/master/MasterDataFormModal';
import { useMasterDataStore } from '@/store/masterDataStore';
import type { Camera, Film, Lens } from '@/types';

type Tab = 'films' | 'cameras' | 'lenses';

export function MasterDataScreen() {
    const [tab, setTab] = useState<Tab>('films');
    const [confirmClear, setConfirmClear] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Film | Camera | Lens | null>(null);
    const {
        films,
        cameras,
        lenses,
        addFilm,
        updateFilm,
        deleteFilm,
        addCamera,
        updateCamera,
        deleteCamera,
        addLens,
        updateLens,
        deleteLens,
        clearAll,
    } = useMasterDataStore();

    function handleAdd(data: MasterFormData) {
        if (tab === 'films') {
            addFilm(data as Omit<Film, 'id'>);
        } else if (tab === 'cameras') {
            addCamera(data as Omit<Camera, 'id'>);
        } else {
            addLens(data as Omit<Lens, 'id'>);
        }
    }

    function handleEdit(data: MasterFormData) {
        if (!editTarget) return;
        if (tab === 'films') {
            updateFilm(editTarget.id, data as Partial<Omit<Film, 'id'>>);
        } else if (tab === 'cameras') {
            updateCamera(editTarget.id, data as Partial<Omit<Camera, 'id'>>);
        } else {
            updateLens(editTarget.id, data as Partial<Omit<Lens, 'id'>>);
        }
    }

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'films', label: '필름', count: films.length },
        { key: 'cameras', label: '카메라', count: cameras.length },
        { key: 'lenses', label: '렌즈', count: lenses.length },
    ];

    const currentLabel = tabs.find((t) => t.key === tab)?.label ?? '';

    return (
        <PageLayout
            title="기본 데이터"
            showBack
            rightAction={
                <button
                    onClick={() => setConfirmClear(true)}
                    className="p-2 text-film-muted hover:text-film-danger transition-colors"
                    title="전체 삭제"
                >
                    <Trash2 size={16} />
                </button>
            }
        >
            {/* Tab bar */}
            <div className="flex border-b border-film-border">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={[
                            'flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-colors',
                            tab === key
                                ? 'text-film-accent border-b-2 border-film-accent -mb-px'
                                : 'text-film-muted hover:text-film-text',
                        ].join(' ')}
                    >
                        {label}
                        <span
                            className={`ml-1.5 text-[10px] ${tab === key ? 'text-film-accent' : 'text-film-border'}`}
                        >
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {confirmClear && (
                <div className="mx-4 mt-4 flex items-center gap-3 bg-film-surface border border-film-danger rounded-xl px-4 py-3">
                    <AlertTriangle size={16} className="shrink-0 text-film-danger" />
                    <span className="flex-1 font-mono text-xs text-film-muted">
                        필름·카메라·렌즈를 모두 삭제합니다
                    </span>
                    <button
                        onClick={() => {
                            clearAll();
                            setConfirmClear(false);
                        }}
                        className="font-mono text-xs text-film-danger hover:text-red-400 transition-colors px-2 py-1"
                    >
                        삭제
                    </button>
                    <button
                        onClick={() => setConfirmClear(false)}
                        className="font-mono text-xs text-film-muted hover:text-film-text transition-colors px-2 py-1"
                    >
                        취소
                    </button>
                </div>
            )}

            <div className="px-4 py-4">
                {/* Add new */}
                <button
                    onClick={() => setAddOpen(true)}
                    className="mb-5 w-full flex items-center justify-center gap-2 bg-film-surface border border-film-border rounded-xl py-3 font-mono text-sm text-film-accent hover:border-film-accent transition-colors"
                >
                    <PlusCircle size={18} />
                    {currentLabel} 추가
                </button>

                {/* List */}
                <div className="bg-film-surface border border-film-border rounded-xl px-4">
                    {tab === 'films' &&
                        (films.length === 0 ? (
                            <EmptyState label="등록된 필름이 없습니다" />
                        ) : (
                            [...films]
                                .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                                .map((film) => (
                                    <FilmRow
                                        key={film.id}
                                        film={film}
                                        onEdit={() => setEditTarget(film)}
                                        onDelete={() => deleteFilm(film.id)}
                                    />
                                ))
                        ))}
                    {tab === 'cameras' &&
                        (cameras.length === 0 ? (
                            <EmptyState label="등록된 카메라가 없습니다" />
                        ) : (
                            [...cameras]
                                .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                                .map((cam) => (
                                    <CameraRow
                                        key={cam.id}
                                        camera={cam}
                                        onEdit={() => setEditTarget(cam)}
                                        onDelete={() => deleteCamera(cam.id)}
                                    />
                                ))
                        ))}
                    {tab === 'lenses' &&
                        (lenses.length === 0 ? (
                            <EmptyState label="등록된 렌즈가 없습니다" />
                        ) : (
                            [...lenses]
                                .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                                .map((lens) => (
                                    <LensRow
                                        key={lens.id}
                                        lens={lens}
                                        onEdit={() => setEditTarget(lens)}
                                        onDelete={() => deleteLens(lens.id)}
                                    />
                                ))
                        ))}
                </div>
            </div>

            {addOpen && (
                <MasterDataFormModal
                    type={tab}
                    onClose={() => setAddOpen(false)}
                    onSubmit={handleAdd}
                />
            )}
            {editTarget && (
                <MasterDataFormModal
                    type={tab}
                    initial={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleEdit}
                />
            )}
        </PageLayout>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="py-8 text-center">
            <p className="text-film-border font-mono text-sm">{label}</p>
        </div>
    );
}
