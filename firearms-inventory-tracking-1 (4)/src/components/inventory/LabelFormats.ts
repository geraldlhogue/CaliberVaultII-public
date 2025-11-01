// Label format definitions for various standard label sizes
export interface LabelFormat {
  id: string;
  name: string;
  description: string;
  width: number; // in inches
  height: number; // in inches
  columns: number;
  rows: number;
  marginTop: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  horizontalGap: number;
  verticalGap: number;
}

export const LABEL_FORMATS: LabelFormat[] = [
  {
    id: 'avery-5160',
    name: 'Avery 5160',
    description: '1" x 2-5/8" Address Labels (30 per sheet)',
    width: 2.625,
    height: 1,
    columns: 3,
    rows: 10,
    marginTop: 0.5,
    marginLeft: 0.1875,
    marginRight: 0.1875,
    marginBottom: 0.5,
    horizontalGap: 0.125,
    verticalGap: 0
  },
  {
    id: 'avery-5163',
    name: 'Avery 5163',
    description: '2" x 4" Shipping Labels (10 per sheet)',
    width: 4,
    height: 2,
    columns: 2,
    rows: 5,
    marginTop: 0.5,
    marginLeft: 0.15625,
    marginRight: 0.15625,
    marginBottom: 0.5,
    horizontalGap: 0.1875,
    verticalGap: 0
  },
  {
    id: 'avery-5167',
    name: 'Avery 5167',
    description: '1/2" x 1-3/4" Return Address (80 per sheet)',
    width: 1.75,
    height: 0.5,
    columns: 4,
    rows: 20,
    marginTop: 0.5,
    marginLeft: 0.3125,
    marginRight: 0.3125,
    marginBottom: 0.5,
    horizontalGap: 0.1875,
    verticalGap: 0
  },
  {
    id: 'dymo-30334',
    name: 'DYMO 30334',
    description: '2-1/4" x 1-1/4" Name Badge',
    width: 2.25,
    height: 1.25,
    columns: 1,
    rows: 1,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    horizontalGap: 0,
    verticalGap: 0
  },
  {
    id: 'custom-large',
    name: 'Large Asset Tag',
    description: '3" x 2" Custom Asset Label',
    width: 3,
    height: 2,
    columns: 2,
    rows: 5,
    marginTop: 0.5,
    marginLeft: 0.5,
    marginRight: 0.5,
    marginBottom: 0.5,
    horizontalGap: 0.25,
    verticalGap: 0.125
  }
];
