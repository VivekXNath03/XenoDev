import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from './Card';

const ChartCard = ({ title, children, action }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
