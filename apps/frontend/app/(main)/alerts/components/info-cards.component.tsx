import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCounts } from '@/types';

interface InfoCardsProps {
  counts: AlertCounts;
}

export const InfoCards = ({ counts }: InfoCardsProps) => {
  return (
    <div className="flex h-full flex-row gap-4 overflow-x-auto scrollbar-none pb-20 snap-y snap-mandatory md:grid md:h-auto md:grid-cols-4 md:gap-6 md:snap-none md:overflow-hidden md:p-0 md:pb-0">
      <Card className="h-40 w-full shrink-0 snap-start ring-1 ring-inset ring-foreground/10 md:h-auto md:w-auto md:snap-none md:shrink">
        <CardHeader>
          <CardDescription className="text-yellow-600">Active</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.ACTIVE}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            This alerts will trigger notifications when the conditions are met.
          </div>
        </CardFooter>
      </Card>
      <Card className="h-40 w-full shrink-0 snap-start ring-1 ring-inset ring-foreground/10 md:h-auto md:w-auto md:snap-none md:shrink">
        <CardHeader>
          <CardDescription className="text-green-600">
            Triggered
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.TRIGGERED}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            This alerts have been triggered and notifications have been sent to
            the user.
          </div>
        </CardFooter>
      </Card>
      <Card className="h-40 w-full shrink-0 snap-start ring-1 ring-inset ring-foreground/10 md:h-auto md:w-auto md:snap-none md:shrink">
        <CardHeader>
          <CardDescription className="text-red-600">Expired</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.EXPIRED}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            This alerts have expired and will not trigger any notifications.
          </div>
        </CardFooter>
      </Card>
      <Card className="h-40 w-full shrink-0 snap-start ring-1 ring-inset ring-foreground/10 md:h-auto md:w-auto md:snap-none md:shrink">
        <CardHeader>
          <CardDescription className="text-gray-600">Cancelled</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {counts.CANCELLED}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            This alerts have been cancelled and will not trigger any
            notifications.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
