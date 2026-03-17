function navigateTo(path) {
    window.location.href = path;
}

// Simulate some initial data
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('pets')) {
    localStorage.setItem('pets', JSON.stringify([]));
}
if (!localStorage.getItem('appointments')) {
    localStorage.setItem('appointments', JSON.stringify([]));
}
if (!localStorage.getItem('adoptionRequests')) {
    localStorage.setItem('adoptionRequests', JSON.stringify([]));
}
if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify([]));
}
if (!localStorage.getItem('announcements')) {
    localStorage.setItem('announcements', JSON.stringify([]));
}
if (!localStorage.getItem('reports')) {
    localStorage.setItem('reports', JSON.stringify([]));
}
if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]));
}
