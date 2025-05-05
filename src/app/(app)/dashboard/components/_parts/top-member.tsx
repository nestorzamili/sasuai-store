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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Top members data
const topMembers = [
  {
    id: 'MBR001',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    memberSince: 'Jan 2023',
    totalSpent: '$4,287.00',
    status: 'vip',
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: 'MBR002',
    name: 'Michael Chen',
    email: 'mchen@example.com',
    memberSince: 'Mar 2023',
    totalSpent: '$3,654.00',
    status: 'vip',
    avatar: '/avatars/michael.jpg',
  },
  {
    id: 'MBR003',
    name: 'Emma Rodriguez',
    email: 'emma.r@example.com',
    memberSince: 'May 2023',
    totalSpent: '$2,985.00',
    status: 'regular',
    avatar: '/avatars/emma.jpg',
  },
  {
    id: 'MBR004',
    name: 'David Kim',
    email: 'davidk@example.com',
    memberSince: 'Aug 2023',
    totalSpent: '$2,740.00',
    status: 'regular',
    avatar: '/avatars/david.jpg',
  },
  {
    id: 'MBR005',
    name: 'Olivia Wilson',
    email: 'olivia.w@example.com',
    memberSince: 'Oct 2023',
    totalSpent: '$2,156.00',
    status: 'new',
    avatar: '/avatars/olivia.jpg',
  },
];

export function TopMember() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Top Members</CardTitle>
        <CardDescription>Members with highest lifetime value</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                  {member.status === 'vip' && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-amber-50 text-amber-700 border-amber-200"
                    >
                      VIP
                    </Badge>
                  )}
                  {member.status === 'new' && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      New
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{member.memberSince}</TableCell>
                <TableCell className="text-right font-medium">
                  {member.totalSpent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
