import { useState } from 'react';
import { PlusCircle, Trash2, AlertTriangle } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Input } from '@/components/ui/Input';
import { FilmRow } from '@/components/master/FilmRow';
import { CameraRow } from '@/components/master/CameraRow';
import { LensRow } from '@/components/master/LensRow';
import { useMasterDataStore } from '@/store/masterDataStore';
import type { ApertureStop } from '@/types';

type Tab = 'films' | 'cameras' | 'lenses';

const APERTURE_STOPS: ApertureStop[] = ['1', '1/2', '1/3'];

export function MasterDataScreen() {
    const [tab, setTab] = useState<Tab>('films');
    const [confirmClear, setConfirmClear] = useState(false);
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

    // Add form state
    const [newName, setNewName] = useState('');
    const [newIso, setNewIso] = useState('400');
    const [newBrand, setNewBrand] = useState('');
    const [newApertureStop, setNewApertureStop] = useState<ApertureStop>('1');
    const [newMaxAperture, setNewMaxAperture] = useState('');

    function resetAddForm() {
        setNewName('');
        setNewIso('400');
        setNewBrand('');
        setNewApertureStop('1');
        setNewMaxAperture('');
    }

    function handleAdd() {
        if (!newName.trim()) return;
        if (tab === 'films') {
            addFilm({ name: newName.trim(), iso: parseInt(newIso) || 400 });
        } else if (tab === 'cameras') {
            addCamera({ name: newName.trim(), ...(newBrand.trim() && { brand: newBrand.trim() }) });
        } else {
            const parsedMax = parseFloat(newMaxAperture);
            addLens({
                name: newName.trim(),
                apertureStop: newApertureStop,
                ...(Number.isFinite(parsedMax) && { maxAperture: parsedMax }),
            });
        }
        resetAddForm();
    }

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'films', label: '필름', count: films.length },
        { key: 'cameras', label: '카메라', count: cameras.length },
        { key: 'lenses', label: '렌즈', count: lenses.length },
    ];

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
                        onClick={() => {
                            setTab(key);
                            resetAddForm();
                        }}
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
                {/* Add new form */}
                <div className="mb-5 flex flex-col gap-2">
                    <div className="flex gap-2">
                    <input
                        className="flex-1 bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors"
                        placeholder={
                            tab === 'films'
                                ? 'e.g., Kodak Gold 200'
                                : tab === 'cameras'
                                  ? 'e.g., Leica M6'
                                  : 'e.g., Summicron 35mm f/2'
                        }
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    {tab === 'films' && (
                        <Input
                            type="number"
                            placeholder="e.g., 400"
                            value={newIso}
                            onChange={(e) => setNewIso(e.target.value)}
                            className="w-20"
                        />
                    )}
                    {tab === 'cameras' && (
                        <input
                            className="w-28 bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors"
                            placeholder="e.g., Leica"
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    )}
                    <button
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="shrink-0 text-film-accent hover:text-yellow-400 disabled:text-film-border disabled:pointer-events-none transition-colors"
                    >
                        <PlusCircle size={24} />
                    </button>
                    </div>
                    {tab === 'lenses' && (
                        <div className="flex gap-2">
                            <div className="grid grid-cols-3 border border-film-border rounded-lg overflow-hidden shrink-0">
                                {APERTURE_STOPS.map((stop) => (
                                    <button
                                        key={stop}
                                        type="button"
                                        onClick={() => setNewApertureStop(stop)}
                                        className={[
                                            'px-3 py-2.5 font-mono text-sm text-center transition-colors',
                                            newApertureStop === stop
                                                ? 'accent-gradient-bg text-film-bg'
                                                : 'text-film-muted hover:text-film-text',
                                        ].join(' ')}
                                    >
                                        {stop}
                                    </button>
                                ))}
                            </div>
                            <input
                                className="flex-1 min-w-0 bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors"
                                placeholder="최대개방 f값 (선택)"
                                value={newMaxAperture}
                                onChange={(e) => setNewMaxAperture(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                type="number"
                                step="0.1"
                            />
                        </div>
                    )}
                </div>

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
                                        onUpdate={(p) => updateFilm(film.id, p)}
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
                                        onUpdate={(p) => updateCamera(cam.id, p)}
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
                                        onUpdate={(p) => updateLens(lens.id, p)}
                                        onDelete={() => deleteLens(lens.id)}
                                    />
                                ))
                        ))}
                </div>
            </div>
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
