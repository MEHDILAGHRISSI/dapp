import React from 'react';
import { MapPin, ChevronDown, Search, Home, Zap, Package, MessageCircle, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ExactHero = () => {
    return (
        <div className="w-full font-sans selection:bg-cyan-200 bg-white">

            {/* Main Dark Container - Exactly 62.5% of viewport */}
            <div className="relative bg-[#0A0D14] text-white h-[62.5vh] min-h-[500px] max-h-[800px]">

                {/* Cyan Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-cyan-800/5 pointer-events-none"></div>


                {/* Hero Content Container */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[calc(62.5vh-120px)] flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">

                        {/* Left Content */}
                        <div className="relative z-10">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] font-extrabold leading-[1.1] tracking-tight mb-4 lg:mb-6">
                                <span className="text-white">Find Real Estate</span>{' '}
                                <br className="hidden sm:block" />
                                <span className="text-white">and Get Your</span>{' '}
                                <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                                    Dream Space
                                </span>
                            </h1>

                            <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-sm lg:max-w-md leading-relaxed mb-6 lg:mb-8">
                                Buy or rent comfortable and beautiful houses in many places.
                            </p>
                        </div>

                        {/* Right Image Container */}
                        <div className="relative flex justify-center lg:justify-end items-center">
                            {/* Cyan Glow Effect */}
                            <div className="absolute -right-10 -top-10 w-72 h-72 lg:w-80 lg:h-80 bg-gradient-to-r from-cyan-400/20 to-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                            {/* Main Image Container */}
                            <div className="relative w-full max-w-[480px] aspect-[4/3] overflow-hidden rounded-[32px] rounded-tr-[140px] rounded-bl-[140px] border-[10px] border-slate-800/30 shadow-2xl shadow-black/50">
                                <img
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
                                    alt="Modern Black House"
                                    className="w-full h-full object-cover"
                                />

                                {/* Image Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                                {/* Floating Glass Badge */}
                                <div className="absolute bottom-4 right-4 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                                    <div className="w-1.5 h-10 bg-gradient-to-b from-red-500 to-red-400 rounded-full"></div>
                                    <div>
                                        <p className="font-bold text-white text-sm sm:text-base">Black Modern House</p>
                                        <div className="flex items-center text-xs text-slate-300 mt-1">
                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                                            New York Street 1260
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ExactHero;