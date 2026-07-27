import React, { useEffect, useState } from 'react';
import API from '../services/api';

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState([
    '✨ Free Shipping on orders above ₹999',
    '🎁 Use code VASTRA20 for 20% OFF',
    '🌸 New Arrivals Every Week!',
  ]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await API.get('/banners?type=announcement');
        if (data.success && data.data.length > 0 && data.data[0].announcements) {
          setAnnouncements(data.data[0].announcements.map((a) => a.text));
        }
      } catch (err) {
        console.log('Using fallback announcements');
      }
    };
    fetchAnnouncements();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

  return (
    <div className="announcement-bar d-flex justify-content-center align-items-center gap-2">
      <span>{announcements[currentIndex]}</span>
    </div>
  );
};

export default AnnouncementBar;
