export const timeSinceLastStudy = (lastStudyDate) => {
    const now = new Date();
    const lastStudy = new Date(lastStudyDate);
    const differenceInSeconds = Math.floor((now - lastStudy) / 1000);

    if (differenceInSeconds < 60) {
        return `${differenceInSeconds}초 전`;
    } else if (differenceInSeconds < 3600) {
        return `${Math.floor(differenceInSeconds / 60)}분 전`;
    } else if (differenceInSeconds < 86400) {
        return `${Math.floor(differenceInSeconds / 3600)}시간 전`;
    } else {
        return `${Math.floor(differenceInSeconds / 86400)}일 전`;
    }
};
