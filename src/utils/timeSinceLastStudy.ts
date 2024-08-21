// utils/timeSinceLastStudy.js
export const timeSinceLastStudy = (lastStudyDate) => {
    try {
        // ISO 형식으로 변환하고 Date 객체 생성
        const lastStudyDateObj = new Date(lastStudyDate);

        if (isNaN(lastStudyDateObj)) {
            throw new Error('Invalid date format');
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - lastStudyDateObj) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}초 전`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}분 전`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        } else if (diffInSeconds < 604800) {
            return `${Math.floor(diffInSeconds / 86400)}일 전`;
        } else {
            return `${Math.floor(diffInSeconds / 604800)}주 전`;
        }
    } catch (error) {
        console.error('Error in timeSinceLastStudy:', error);
        return '알 수 없음';
    }
};
