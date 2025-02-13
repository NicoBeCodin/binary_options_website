'use client';

import React from 'react';
import Markets from '@/components/Markets';
import CreateMarket from '@/components/CreateMarket';

export default function Home() {
    return (
        <div className="pt-20">
            <section id="markets" className="py-20">
                <Markets />
            </section>

        </div>
    );
}
