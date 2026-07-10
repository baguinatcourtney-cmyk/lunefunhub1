/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import IdCard from './IdCard';

export default function AboutMe() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] font-fredoka text-white p-4">
      <div className="w-full max-w-sm">
        <IdCard
          name="Des"
          sex="Female"
          age={21}
          country="Philippines"
          luneSince="2022"
          avatar="🐺"
          coins={999}
          rank="Full Moon"
          bias="K 👑"
          biasWrecker="Jo 🍚"
          stanlist="&TEAM (Ultimate Group) 🐾"
          socials={{
            twitter: "https://x.com/K_ate_9",
            tiktok: "https://www.tiktok.com/@dscrtnykt",
            instagram: "https://instagram.com/dscrtnykt"
          }}
        />
      </div>
    </div>
  );
}
