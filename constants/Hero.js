// BooksImages.js (C:\Users\dell\Documents\JOB\ThreeJS\Javascript\Book\constants\)

// রিলেটিভ পাথ ব্যবহার করে ইমেজ ইম্পোর্ট করা হচ্ছে
// আপনার current file (BooksImages.js) থেকে ইমেজ ফোল্ডারের সঠিক রিলেটিভ পাথ দিন।
// এখানে, 'constants' ফোল্ডার থেকে এক ধাপ উপরে (Book/) গিয়ে তারপর 'assets/images' এ প্রবেশ করা হয়েছে।

import SFHero from '../assets/images/SF.png'; // <-- এখানে পাথ ঠিক করা হয়েছে
import ADV from '../assets/images/ADV.png';
import CR from '../assets/images/CR.png';
import BIOG from '../assets/images/BIOG.png';
import kid from '../assets/images/Kid.png';


// সব ইম্পোর্ট করা ইমেজ রেফারেন্সগুলো এক্সপোর্ট করা হচ্ছে
export const HeroImage= [
  { id: 1, name: 'SFHero', image: SFHero },
  { id: 2, name: 'Adventure', image: ADV },
  { id: 3, name: 'Crime', image: CR },
  { id: 4, name: 'Biography', image: BIOG },
  { id: 5, name: 'Kid', image: kid }
]