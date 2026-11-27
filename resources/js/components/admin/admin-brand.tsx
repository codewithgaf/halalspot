import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';

export function AdminBrand({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <div className="px-5 pt-7 pb-7">
            <Link
                href="/admin"
                onClick={onNavigate}
                className="inline-flex items-center gap-3 text-white"
            >
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/20">
                    <MapPin
                        className="size-5 text-emerald-300"
                        aria-hidden="true"
                    />
                </span>
                <span>
                    <span className="block text-xl font-extrabold tracking-tight">
                        halalspot<span className="text-emerald-300">.</span>
                    </span>
                    <span className="block text-[10px] font-semibold tracking-[0.23em] text-emerald-200/65 uppercase">
                        Admin workspace
                    </span>
                </span>
            </Link>
        </div>
    );
}
