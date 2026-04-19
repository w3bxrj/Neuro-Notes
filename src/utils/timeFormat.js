export const processFirebaseTime = (firebaseTimestamp) => {
  if (firebaseTimestamp?.toMillis) {
    return firebaseTimestamp.toMillis();
  }
  return Date.now();
};
