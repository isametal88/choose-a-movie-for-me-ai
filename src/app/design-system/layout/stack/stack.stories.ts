import type { Meta, StoryObj } from '@storybook/angular';
import { StackComponent } from './stack.component';

const meta: Meta<StackComponent> = {
  title: 'Design System/Layout/Stack',
  component: StackComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<StackComponent>;

const item = `<div style="background:#374151;color:white;padding:.5rem 1rem;border-radius:4px">Item</div>`;

export const Vertical: Story = {
  args: { direction: 'column', gap: '4' },
  render: (args) => ({
    props: args,
    template: `<ds-stack [direction]="direction" [gap]="gap">${item}${item}${item}</ds-stack>`,
  }),
};

export const Horizontal: Story = {
  args: { direction: 'row', gap: '4', align: 'center' },
  render: (args) => ({
    props: args,
    template: `<ds-stack [direction]="direction" [gap]="gap" [align]="align">${item}${item}${item}</ds-stack>`,
  }),
};

export const Wrapping: Story = {
  args: { direction: 'row', gap: '2', wrap: true },
  render: (args) => ({
    props: args,
    template: `<ds-stack [direction]="direction" [gap]="gap" [wrap]="wrap" style="max-width:300px">${item.repeat(8)}</ds-stack>`,
  }),
};
