import { useEffect, useRef } from 'react';
import './TradingviewWidget.css';
import { widget, ChartingLibraryWidgetOptions, ResolutionString, ThemeName } from 'charting_library';
import * as React from 'react';

export const TradingviewWidget = () => {
	const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

	useEffect(() => {
		const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: 'AAPL',

			// BEWARE: no trailing slash is expected in feed URL
			datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com'),
			interval: 'D' as ResolutionString,
			container: chartContainerRef.current,
			library_path: '/charting_library/',
			locale:  'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: 'https://saveload.tradingview.com',
			charts_storage_api_version: '1.1',
			client_id: 'tradingview.com',
      user_id: 'Tradingmaestro12',
			fullscreen: false,
      autosize: true,
			studies_overrides: {},
      // enabled_features: ['chart_property_page_trading'],
      theme: 'Dark' as ThemeName, 
		};

		const tvWidget = new widget(widgetOptions);

		tvWidget.onChartReady(() => {
      
			tvWidget.headerReady().then(() => {
				const button = tvWidget.createButton();
				button.setAttribute('title', 'Click to show a notification popup');
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', () => tvWidget.showNoticeDialog({
						title: 'Notification',
						body: 'TradingView Charting Library API works correctly',
						callback: () => {
							console.log('Noticed!');
						},
					}));
				button.innerHTML = 'Check API';
			});
		});

		return () => {
			tvWidget.remove();
		};
	});

	return <div ref={ chartContainerRef } className={ 'TVChartContainer' } />
};
