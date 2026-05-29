import type { Meta, StoryObj } from '@storybook/angular';
import { ChipComponent } from './chip.component';

const meta: Meta<ChipComponent> = {
  title: 'Design System/Components/Chip',
  component: ChipComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<ChipComponent>;

export const Unselected: Story = {
  render: () => ({ template: `<ds-chip>Action</ds-chip>` }),
};

export const Selected: Story = {
  render: () => ({ template: `<ds-chip [selected]="true">Action</ds-chip>` }),
};
