import React, {Component} from 'react'
import {TimelineLite, Linear, Back} from 'gsap'

import './App.css'

const progressTimeFrames = [
	0,
	.125,
	.375,
	.625,
	.875,
	1
];
const progressClipPath = [
	[
		50,  50,
		50,  0,
		50,  0,
		50,  0,
		50,  0,
		50,  0,
		50,  0
	],
	[
		50,  50,
		100, 0,
		100, 0,
		100, 0,
		100, 0,
		100, 0,
		50,  0
	],
	[
		50,  50,
		100, 100,
		100, 100,
		100, 100,
		100, 100,
		100, 0,
		50,  0
	],
	[
		50,  50,
		0, 	 100,
		0, 	 100,
		0,   100,
		100, 100,
		100, 0,
		50,  0
	],
	[
		50,  50,
		0,   0,
		0,   0,
		0,   100,
		100, 100,
		100, 0,
		50,  0
	],
	[
		50,  50,
		50,  0,
		0,   0,
		0,   100,
		100, 100,
		100, 0,
		50,  0
	]
];

export default class App extends Component {
	items = [
		{
			color: '#298CFF',
			icon: 'home'
		},
		{
			color: '#30A400',
			icon: 'search'
		},
		{
			color: '#FF4B32',
			icon: 'bell'
		},
		{
			color: '#8A39FF',
			icon: 'gear'
		},
		{
			color: '#FF6A00',
			icon: 'map-pin'
		}
	];

	buttonSize = 50;

	item = {};
	container = [];
	shadows = [];
	borders = [];
	corners = [];
	buttons = [];

	rotateDuration = .4;
	buttonsDuration = .4;

	getItemAngleByIndex(index) {
		return 360 / this.items.length * index
	}

	play(itemIndex) {
		if(this.disabled) {
			return
		}

		const self = this;
		const timeLine = new TimelineLite();

		this.disabled = true;

		self.item[itemIndex].style.zIndex = 1;

		timeLine.add('rotation');
		progressClipPath.forEach((clipPath, index, list) => {
			if(index === list.length - 1) {
				return
			}

			timeLine.to(
				progressClipPath[index].slice(),
				self.rotateDuration * (progressTimeFrames[index + 1] - progressTimeFrames[index]),
				{
					...progressClipPath[index + 1].slice(),
					onUpdate() {
						self.borders[itemIndex].style.WebkitClipPath = `polygon(${
							String(this.target)
								.split(/,\s*/)
								.map((value, index, list) => `${value}%${index % 2 ? index === list.length - 1 ? '' : ',' : ' '}`)
								.join('')
						})`
					},
					ease: Linear.easeNone
				},
				index ? void 0 : 'rotation'
			)
		});

		timeLine.to(self.shadows[itemIndex], self.rotateDuration, {
			rotation: -360,
			ease: Linear.easeNone
		}, 'rotation');
		timeLine.to(self.container[itemIndex], self.rotateDuration, {
			rotation: 360,
			onComplete() {
				self.buttons
					.concat(self.corners)
					.forEach(button => button.style.opacity = 0)
			},
			ease: Linear.easeNone
		}, 'rotation');

		timeLine.add('scale');
		timeLine.to(self.shadows[itemIndex], this.buttonsDuration, {
			scale: 1.2,
			opacity: 0,
			ease: Linear.easeNone
		}, 'scale');
		timeLine.to(self.menuButton, this.buttonsDuration, {
			scale: 0,
			ease: Linear.easeNone
		}, 'scale');
		timeLine.to(self.menuButton, .1, {
			rotation: 45,
			onComplete() {
				self.buttonsIsVisible = false;
				self.menuButtonInner.classList[self.buttonsIsVisible ? 'add' : 'remove']('fa-close');
				self.menuButtonInner.classList[self.buttonsIsVisible ? 'remove' : 'add']('fa-bars');
			},
			ease: Linear.easeNone
		});

		timeLine.to(self.menuButton, this.buttonsDuration, {
			opacity: 1,
			rotation: 0,
			scale: 1,
			onComplete() {
				self.buttons
					.concat(self.corners)
					.forEach(button => button.style.opacity = '');

				self.item[itemIndex].style.zIndex = '';

				timeLine.pause();
				timeLine.progress(0);
				timeLine.clear();

				self.clearButtonsAnimation();

				self.disabled = false
			},
			ease: Back.easeNone
		});
	}

	toggleButtons() {
		if(this.disabled) {
			return
		}

		this.disabled = true;

		this.buttonsIsVisible = !this.buttonsIsVisible;

		new TimelineLite()
			.to(this.menuButton, this.buttonsDuration / 2, {
				rotation: 45,
				onComplete: () => {
					this.menuButtonInner.classList[this.buttonsIsVisible ? 'add' : 'remove']('fa-close');
					this.menuButtonInner.classList[this.buttonsIsVisible ? 'remove' : 'add']('fa-bars');
				},
				ease: Back.easeOut
			})
			.to(this.menuButton, this.buttonsDuration / 2, {
				rotation: 0,
				onComplete: () => this.disabled = false,
				ease: Back.easeOut
			});

		const timeLine = this.mainButtonTL = new TimelineLite();

		timeLine.add('container');

		timeLine.to(this.menuButton, this.buttonsDuration, {
			opacity: this.buttonsIsVisible ? .5 : 1,
			ease: Back.easeOut
		}, 'container');

		this.container.forEach(element => {
			timeLine.to(element, this.buttonsDuration, {
				scale: +this.buttonsIsVisible,
				ease: Back.easeOut
			}, 'container')
		});
	}

	clearButtonsAnimation() {
		if(this.mainButtonTL) {
			this.mainButtonTL.pause();
			this.mainButtonTL.progress(0);
			this.mainButtonTL.clear();
			delete this.mainButtonTL;
		}
	}

	render() {
		return <nav>
			<button
				ref={self => this.menuButton = self}
				style={{
					height: this.buttonSize,
					width: this.buttonSize
				}}
				onClick={() => this.toggleButtons()}
			>
				<div
					ref={self => this.menuButtonInner = self}
					className="fa fa-bars"
				/>
			</button>
			<ul>
				{this.items.map((item, index) => <li
					ref={self => this.item[index] = self}
					key={index}
					style={{transform: `rotate(${this.getItemAngleByIndex(index)}deg)`}}
				>
					<div
						ref={self => this.container[index] = self}
						className="item"
					>
						<div
							ref={self => this.shadows[index] = self}
							className="button-shadow"
							style={{
								color: item.color
							}}
						>
							<div
								ref={self => this.borders[index] = self}
								className="border"
								style={{
									borderWidth: this.buttonSize
								}}
							/>
							<div
								ref={self => this.corners[index] = self}
								className="corner"
								style={{
									borderWidth: this.buttonSize / 2,
									marginLeft: -this.buttonSize / 2
								}}
							/>
						</div>
						<button
							ref={self => this.buttons[index] = self}
							className={`fa fa-${item.icon}`}
							style={{
								background: item.color,
								height: this.buttonSize,
								transform: `rotate(${-this.getItemAngleByIndex(index)}deg)`,
								width: this.buttonSize
							}}
							onClick={() => this.play(index)}
						/>
					</div>
				</li>)}
			</ul>
		</nav>
	}
}
