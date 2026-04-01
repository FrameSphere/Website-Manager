import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('id') || ''

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://site-control-nine.vercel.app'

  const script = `
(function() {
  'use strict';
  var SITE_ID = '${siteId}';
  var API = '${baseUrl}/api/track';
  if (!SITE_ID) return;

  function getDevice() {
    var w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1200) return 'tablet';
    return 'desktop';
  }

  function send(type, extra) {
    try {
      var payload = {
        site_id: SITE_ID,
        event_type: type,
        path: window.location.pathname,
        referrer: document.referrer || null,
        device: getDevice(),
        country: null,
      };
      if (extra) Object.assign(payload, extra);
      navigator.sendBeacon
        ? navigator.sendBeacon(API, JSON.stringify(payload))
        : fetch(API, { method: 'POST', body: JSON.stringify(payload), keepalive: true });
    } catch(e) {}
  }

  // Pageview on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { send('pageview'); });
  } else {
    send('pageview');
  }

  // SPA navigation support (history API)
  var _pushState = history.pushState.bind(history);
  history.pushState = function() {
    _pushState.apply(history, arguments);
    setTimeout(function() { send('pageview'); }, 50);
  };
  window.addEventListener('popstate', function() { send('pageview'); });

  // Outbound link tracking
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || !a.href) return;
    try {
      var target = new URL(a.href);
      if (target.host !== window.location.host) {
        send('outbound_click', { path: a.href });
      }
    } catch(e) {}
  });

  // Error tracking
  window.addEventListener('error', function(e) {
    send('error', { path: window.location.pathname + ' | ' + (e.message || 'JS Error') });
  });
})();
`.trim()

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
