import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Member activities data
const memberActivities = [
  {
    id: 'ACT001',
    member: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
    },
    action: 'Purchase',
    details: 'Premium T-Shirt, Wireless Earbuds',
    amount: '$345.00',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: 'ACT002',
    member: {
      name: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
    },
    action: 'Account Update',
    details: 'Changed shipping address',
    amount: null,
    timestamp: '4 hours ago',
    status: 'completed',
  },
  {
    id: 'ACT003',
    member: {
      name: 'Emma Rodriguez',
      avatar: '/avatars/emma.jpg',
    },
    action: 'Refund Request',
    details: 'Smart Watch - defective',
    amount: '$249.99',
    timestamp: '6 hours ago',
    status: 'pending',
  },
  {
    id: 'ACT004',
    member: {
      name: 'David Kim',
      avatar: '/avatars/david.jpg',
    },
    action: 'Review',
    details: 'Left 5-star review for Leather Wallet',
    amount: null,
    timestamp: '1 day ago',
    status: 'completed',
  },
  {
    id: 'ACT005',
    member: {
      name: 'Olivia Wilson',
      avatar: '/avatars/olivia.jpg',
    },
    action: 'Subscription',
    details: 'Renewed Premium Membership',
    amount: '$99.00',
    timestamp: '1 day ago',
    status: 'completed',
  },
];

export function MemberActivities() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Recent Member Activities
        </CardTitle>
        <CardDescription>
          Latest member interactions and transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={activity.member.avatar}
                      alt={activity.member.name}
                    />
                    <AvatarFallback>
                      {activity.member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{activity.member.name}</span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.details}
                  </div>
                  {activity.amount && (
                    <div className="text-xs font-medium">{activity.amount}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </TableCell>
                <TableCell className="text-right">
                  {activity.status === 'completed' ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
