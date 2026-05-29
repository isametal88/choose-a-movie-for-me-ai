import type { Meta, StoryObj } from '@storybook/angular';
import { GridComponent } from './grid.component';

const meta: Meta<GridComponent> = {
  title: 'Design System/Layout/Grid',
  component: GridComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<GridComponent>;

const item = `<div style="background:#374151;color:white;padding:1rem;border-radius:4px;text-align:center">Item</div>`;

export const ThreeColumn: Story = {
  args: { columns: 3, gap: '4' },
  render: (args) => ({
    props: args,
    template: `<ds-grid [columns]="columns" [gap]="gap">${item.repeat(6)}</ds-grid>`,
  }),
};

export const AutoFill: Story = {
  args: { columns: 'auto', gap: '4' },
  render: (args) => ({
    props: args,
    template: `<ds-grid [columns]="columns" [gap]="gap">${item.repeat(8)}</ds-grid>`,
  }),
};

export const MinWidth: Story = {
  args: { minItemWidth: '160px', gap: '4' },
  render: (args) => ({
    props: args,
    template: `<ds-grid [minItemWidth]="minItemWidth" [gap]="gap">${item.repeat(10)}</ds-grid>`,
  }),
};
