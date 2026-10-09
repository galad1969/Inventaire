/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "f862c60d5c5d2c217adbbf1b2c4774ec"
  }, {
    "url": "pwa-512x512.png",
    "revision": "0b296505de22fafc5b0e248dfb7981a9"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2157f52b84104b0d8ab5dae4aa116c91"
  }, {
    "url": "manifest.json",
    "revision": "8420e355f3670c4e7476e56b039348ef"
  }, {
    "url": "index.html",
    "revision": "6386ad2656e590ba8b4c439a5a94dffc"
  }, {
    "url": "icon.svg",
    "revision": "d506c8b5aaf0525f148bae50981c5fd7"
  }, {
    "url": "favicon.png",
    "revision": "bf79b1bccad6584db0418ad98969f5c4"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b45042b7ebb1f2f719058559e58a9155"
  }, {
    "url": "404.html",
    "revision": "61876565cc5774944f2ea83a4e72537f"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-Clos8Py9.css",
    "revision": null
  }, {
    "url": "assets/index-BnNuNI-p.js",
    "revision": null
  }, {
    "url": ".nojekyll",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b45042b7ebb1f2f719058559e58a9155"
  }, {
    "url": "favicon.png",
    "revision": "bf79b1bccad6584db0418ad98969f5c4"
  }, {
    "url": "icon.svg",
    "revision": "d506c8b5aaf0525f148bae50981c5fd7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2157f52b84104b0d8ab5dae4aa116c91"
  }, {
    "url": "pwa-512x512.png",
    "revision": "0b296505de22fafc5b0e248dfb7981a9"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "f862c60d5c5d2c217adbbf1b2c4774ec"
  }, {
    "url": "manifest.webmanifest",
    "revision": "4c9d200f69b41ce66a10f3fb1e0b8df7"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-stylesheets",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-webfonts",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
