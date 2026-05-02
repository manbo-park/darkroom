import { useFrameStore } from '../store/useFrameStore';
import type { FrameItem } from '../types/frame';

function formatDate(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatExposureTime(value: number | null): string {
    if (value === null) return '—';
    if (value >= 1) return `${value}"`;
    return `1/${Math.round(1 / value)}`;
}

function FrameRow({ frame }: { frame: FrameItem }) {
    const { selectedIds, toggleSelect, lastClickedId } = useFrameStore();
    const isSelected = selectedIds.has(frame.id);
    const { meta } = frame;

    const handleClick = (e: React.MouseEvent) => {
        toggleSelect(frame.id, e.shiftKey, lastClickedId);
    };

    return (
        <tr
            className={`border-b border-gray-100 cursor-pointer select-none transition-colors ${
                isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
            }`}
            onClick={handleClick}
        >
            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                        toggleSelect(frame.id, e.nativeEvent instanceof MouseEvent && e.nativeEvent.shiftKey, lastClickedId)
                    }
                    className="cursor-pointer accent-blue-500"
                />
            </td>
            <td className="px-3 py-2">
                {frame.thumbnailUrl ? (
                    <img
                        src={frame.thumbnailUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                        draggable={false}
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">
                        없음
                    </div>
                )}
            </td>
            <td className="px-3 py-2 text-center text-sm text-gray-600 tabular-nums">
                {frame.frameNumber ?? '—'}
            </td>
            <td className="px-3 py-2 text-sm text-gray-700 max-w-[180px] truncate" title={frame.file.name}>
                {frame.file.name}
            </td>
            <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap tabular-nums">
                {formatDate(meta.dateTimeOriginal)}
            </td>
            <td className="px-3 py-2 text-sm text-gray-700">
                {[meta.make, meta.model].filter(Boolean).join(' ') || '—'}
            </td>
            <td className="px-3 py-2 text-sm text-gray-700 max-w-[140px] truncate" title={meta.lensModel ?? ''}>
                {meta.lensModel ?? '—'}
            </td>
            <td className="px-3 py-2 text-sm text-gray-600 text-center tabular-nums">
                {meta.fNumber != null ? `f/${meta.fNumber}` : '—'}
            </td>
            <td className="px-3 py-2 text-sm text-gray-600 text-center tabular-nums">
                {formatExposureTime(meta.exposureTime)}
            </td>
            <td className="px-3 py-2 text-sm text-gray-600 text-center tabular-nums">
                {meta.iso ?? '—'}
            </td>
            <td className="px-3 py-2 text-sm text-gray-400 max-w-[120px] truncate" title={meta.userComment ?? ''}>
                {meta.userComment ?? '—'}
            </td>
        </tr>
    );
}

export function FrameTable() {
    const { frames, selectedIds, selectAll, clearSelection } = useFrameStore();
    const allSelected = frames.length > 0 && selectedIds.size === frames.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-xs text-gray-500 uppercase tracking-wide">
                        <th className="px-3 py-2">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = someSelected;
                                }}
                                onChange={() => (allSelected ? clearSelection() : selectAll())}
                                className="cursor-pointer accent-blue-500"
                            />
                        </th>
                        <th className="px-3 py-2">썸네일</th>
                        <th className="px-3 py-2 text-center">프레임</th>
                        <th className="px-3 py-2">파일명</th>
                        <th className="px-3 py-2">촬영시간</th>
                        <th className="px-3 py-2">카메라</th>
                        <th className="px-3 py-2">렌즈</th>
                        <th className="px-3 py-2 text-center">조리개</th>
                        <th className="px-3 py-2 text-center">셔터</th>
                        <th className="px-3 py-2 text-center">ISO</th>
                        <th className="px-3 py-2">메모</th>
                    </tr>
                </thead>
                <tbody>
                    {frames.map((frame) => (
                        <FrameRow key={frame.id} frame={frame} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
