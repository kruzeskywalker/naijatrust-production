const fileFilter = (originalname) => {
    // Accept images only with case-insensitive check
    return !!originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i);
};

describe('Logo Upload Regex', () => {
    test('should allow lowercase extensions', () => {
        expect(fileFilter('test.png')).toBe(true);
        expect(fileFilter('test.jpg')).toBe(true);
        expect(fileFilter('test.jpeg')).toBe(true);
        expect(fileFilter('test.webp')).toBe(true);
        expect(fileFilter('test.gif')).toBe(true);
    });

    test('should allow uppercase extensions', () => {
        expect(fileFilter('test.PNG')).toBe(true);
        expect(fileFilter('test.JPG')).toBe(true);
        expect(fileFilter('test.JPEG')).toBe(true);
        expect(fileFilter('test.WEBP')).toBe(true);
        expect(fileFilter('test.GIF')).toBe(true);
    });

    test('should allow mixed case extensions', () => {
        expect(fileFilter('test.Png')).toBe(true);
        expect(fileFilter('test.Jpg')).toBe(true);
    });

    test('should reject non-image extensions', () => {
        expect(fileFilter('test.pdf')).toBe(false);
        expect(fileFilter('test.txt')).toBe(false);
        expect(fileFilter('test.exe')).toBe(false);
        expect(fileFilter('test.zip')).toBe(false);
    });
});
