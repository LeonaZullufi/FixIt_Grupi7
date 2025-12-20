/**
 * @param {Error} error - Firebase error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  const defaultMessage =
    "Gabim gjatë ruajtjes së profilit. Ju lutem provoni përsëri.";

  if (!error || !error.code) {
    return defaultMessage;
  }

  const errorMessages = {
    "auth/wrong-password":
      "Password-i aktual është i pasaktë. Ju lutem shkruani password-in tuaj aktual.",
    "auth/invalid-credential":
      "Password-i aktual është i pasaktë. Ju lutem shkruani password-in tuaj aktual.",
    "auth/email-already-in-use":
      "Ky email është tashmë në përdorim nga një tjetër llogari.",
    "auth/weak-password":
      "Password-i i ri është shumë i dobët. Përdorni të paktën 6 karaktere.",
    "auth/requires-recent-login":
      "Kërkohet ri-kyçje e fundit. Përpara se të ndryshoni informacione sensitive, ju lutem dilni dhe kyçuni sërish.",
  };

  return errorMessages[error.code] || defaultMessage;
};
