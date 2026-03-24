import { useState, useEffect } from 'react';
import { getSignedStorageUrl } from '@/lib/utils';
import { AvatarImage } from '@/components/ui/avatar';

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    path: string | null | undefined;
    bucket: string;
    fallback?: React.ReactNode;
}

export function StorageImage({ path, bucket, fallback = null, ...imgProps }: StorageImageProps) {
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        if (!path) { setUrl(''); return; }
        getSignedStorageUrl(bucket, path).then(setUrl);
    }, [path, bucket]);

    if (!url) return fallback as React.ReactElement ?? null;
    return <img src={url} {...imgProps} />;
}

interface StorageAvatarImageProps {
    path: string | null | undefined;
    bucket: string;
    className?: string;
}

export function StorageAvatarImage({ path, bucket, className }: StorageAvatarImageProps) {
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        if (!path) { setUrl(''); return; }
        getSignedStorageUrl(bucket, path).then(setUrl);
    }, [path, bucket]);

    if (!url) return null;
    return <AvatarImage src={url} className={className} />;
}
