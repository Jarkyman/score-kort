import { useState, useEffect } from 'react';

export default function BetaPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenBeta = localStorage.getItem('scorekort_seen_beta_popup');
        if (!hasSeenBeta) {
            setIsOpen(true);
        }
    }, []);

    const closePopup = () => {
        localStorage.setItem('scorekort_seen_beta_popup', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-auto transform transition-all">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    👋
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Beta Version!</h2>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    Halløj halløj! Vi tester lige om automatiseringen virker.<br/><br/>
                    Bemærk at siden stadig er i Beta, men vi er snart klar med alle landets baner! 😄
                </p>
                <button
                    onClick={closePopup}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md"
                >
                    Forstået!
                </button>
            </div>
        </div>
    );
}
