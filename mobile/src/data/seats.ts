export interface Seat {
    id: string;
    total: number;
    male: number;
    female: number;
    tag?: string;
    color?: string;
  }
  
  export const seats: Seat[] = [
    { id: 'VIP 1', total: 6, male: 2, female: 4, tag: '热聊中', color: 'hotpink' },
    { id: 'VIP 2', total: 8, male: 4, female: 4, tag: '氛围佳', color: 'dodgerblue' },
    { id: 'VIP 4', total: 10, male: 5, female: 5, tag: '静音中', color: 'limegreen' },
    { id: 'VIP 6', total: 7, male: 2, female: 5, tag: '火热组局', color: 'deeppink' },
    { id: '001', total: 3, male: 1, female: 2, tag: '缺男生', color: 'slateblue' },
    { id: '002', total: 4, male: 3, female: 1, tag: '缺女生', color: 'mediumseagreen' },
  ];
  