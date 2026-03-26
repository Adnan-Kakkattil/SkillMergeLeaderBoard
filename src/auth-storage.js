const TOKEN_KEY = "skillmerge_token";

export const loadToken = () => localStorage.getItem(TOKEN_KEY) || "";

export const saveToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
};
