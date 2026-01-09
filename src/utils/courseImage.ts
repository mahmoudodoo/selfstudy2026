export function getCourseInitials(title: string): string {
    if (!title || typeof title !== 'string' || title.trim().length === 0) return 'CS';

    const trimmedTitle = title.trim();
    const words = trimmedTitle.split(/\s+/).filter(word => word.length > 0);

    if (words.length >= 2) {
        const firstChar = words[0][0] || 'C';
        const secondChar = words[1][0] || 'S';
        return `${firstChar}${secondChar}`.toUpperCase();
    }

    if (trimmedTitle.length >= 2) {
        return trimmedTitle.substring(0, 2).toUpperCase();
    }

    return (trimmedTitle.charAt(0) + 'S').toUpperCase();
}

export function getCourseColor(title: string): string {
    if (!title) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f56565 0%, #ed8936 100%)',
        'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
        'linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%)',
        'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
        'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
        'linear-gradient(135deg, #4c51bf 0%, #2d3748 100%)',
        'linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%)'
    ];

    const index = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

export function shouldUseGeneratedImage(imageUrl?: string): boolean {
    if (!imageUrl || imageUrl.trim() === '') return true;

    const url = imageUrl.toLowerCase();
    return url.includes('placeholder') ||
    url.includes('via.placeholder') ||
    url.includes('data:image') ||
    !url.startsWith('http');
}

export function isValidImageUrl(url?: string): boolean {
    if (!url) return false;
    return url.startsWith('http') &&
    !url.includes('placeholder') &&
    !url.includes('via.placeholder');
}
