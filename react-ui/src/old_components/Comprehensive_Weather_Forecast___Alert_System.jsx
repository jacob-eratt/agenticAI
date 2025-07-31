
import React from 'react';
import Section from './Section';
import Text from './Text';
import Button from './Button';
import Message from './Message';
import List from './List';
import ScrollableContainer from './ScrollableContainer';
import Chart from './Chart';
import Banner from './Banner';
import Panel from './Panel';
import CheckboxGroup from './CheckboxGroup';

export default function Comprehensive_Weather_Forecast___Alert_System() {
  return (
    <div className="main-weather-display">
      <Section />
      <Text />
      <Section />
      <Section />
      <Text />
      <Button />
      <Message />
      <Message />
      <Text />
      <List />
      <ScrollableContainer />
      <Chart />
      <Section />
      <Banner />
      <List />
      <Panel />
      <Section />
      <Section />
      <CheckboxGroup />
    </div>
  );
}
