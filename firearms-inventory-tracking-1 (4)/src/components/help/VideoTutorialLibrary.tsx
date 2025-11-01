import { useState } from 'react';
import { Play, Search, Filter, Clock, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  videoUrl: string;
  views: number;
}

const videos: VideoTutorial[] = [
  {
    id: '1',
    title: 'Getting Started with CaliberVault',
    description: 'Learn the basics of navigating and using CaliberVault',
    duration: '5:30',
    category: 'Getting Started',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video1',
    views: 1250
  },
  {
    id: '2',
    title: 'Adding Your First Firearm',
    description: 'Step-by-step guide to adding firearms to your inventory',
    duration: '8:15',
    category: 'Inventory',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video2',
    views: 980
  },
  {
    id: '3',
    title: 'Using Barcode Scanner',
    description: 'How to scan UPC codes and add items quickly',
    duration: '6:45',
    category: 'Features',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video3',
    views: 750
  },
  {
    id: '4',
    title: 'Advanced Search & Filters',
    description: 'Master advanced search techniques and custom filters',
    duration: '12:20',
    category: 'Features',
    difficulty: 'Advanced',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video4',
    views: 620
  },
  {
    id: '5',
    title: 'Generating Reports',
    description: 'Create custom reports and export your inventory data',
    duration: '10:00',
    category: 'Reports',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video5',
    views: 540
  },
  {
    id: '6',
    title: 'Team Collaboration Features',
    description: 'Set up teams and manage shared inventory',
    duration: '15:30',
    category: 'Teams',
    difficulty: 'Advanced',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://example.com/video6',
    views: 430
  }
];

export function VideoTutorialLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVideo(video)}>
            <div className="relative aspect-video bg-muted">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>
              <Badge className="absolute top-2 right-2">{video.difficulty}</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{video.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <p className="text-white">Video Player: {selectedVideo?.videoUrl}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">{selectedVideo?.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge>{selectedVideo?.difficulty}</Badge>
              <span>{selectedVideo?.duration}</span>
              <span>{selectedVideo?.views} views</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
