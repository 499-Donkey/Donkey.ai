import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import '../styles/home.css';

const Home: React.FC = () => {
    const [index, setIndex] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const handleSelect = (selectedIndex: number, e: any) => {
        setIndex(selectedIndex);
        setIsPaused(e === 'mouseenter');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setIndex((prevIndex) =>
                    prevIndex === 2 ? 0 : prevIndex + 1
                );
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <div className="contain">
            <h1>Welcome to Donkey.AI</h1>
            <Carousel
                activeIndex={index}
                onSelect={handleSelect}
                pause={false}
            >
                <Carousel.Item>
                    <img
                        className="d-block"
                        src="https://via.placeholder.com/800x400?text=First+slide"
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>This is Donkey</h3>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block"
                        src="https://via.placeholder.com/800x400?text=Second+slide"
                        alt="Second slide"
                    />
                    <Carousel.Caption>
                        <h3>We save your time</h3>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block"
                        src="https://via.placeholder.com/800x400?text=Third+slide"
                        alt="Third slide"
                    />
                    <Carousel.Caption>
                        <h3>We save your life</h3>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    );
};

export default Home;
