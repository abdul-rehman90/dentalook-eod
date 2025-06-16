import Cookies from 'js-cookie';

export function getUserAndToken() {
  // const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
  const token = Cookies.get('auth-token') || null;
  return { token };
}

export function setUserAndToken(token, user) {
  // Cookies.set('user', JSON.stringify(user));
  Cookies.set('auth-token', token, {
    sameSite: 'Strict', // Helps prevent CSRF attacks
    path: '/' // Accessible across the entire site
  });
}

export function removeUserAndToken() {
  Cookies.remove('user');
  Cookies.remove('auth-token');
}
