// common.js — 所有页面共用的主题切换逻辑
(function() {
    "use strict";

    // 切换主题核心函数
    window.toggleTheme = function() {
        const html = document.documentElement;
        const icon = document.getElementById('themeIcon');
        if (!icon) return;

        const isDark = html.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem("pref-theme", newTheme);

        icon.textContent = isDark ? '☀️' : '🌙';
    };

    // 初始化：页面加载时恢复主题
    function restoreTheme() {
        const savedTheme = localStorage.getItem("pref-theme");
        const html = document.documentElement;
        const icon = document.getElementById('themeIcon');

        if (savedTheme === "light") {
            html.setAttribute('data-theme', 'light');
            if (icon) {
                icon.textContent = '☀️';
            }
        }
    }

    // DOM 加载完后立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreTheme);
    } else {
        restoreTheme();
    }
})();
