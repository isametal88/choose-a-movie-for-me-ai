import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Design System/Components/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => ({ props: args, template: `<ds-badge [variant]="variant">Default</ds-badge>` }),
};
export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => ({ props: args, template: `<ds-badge [variant]="variant">Success</ds-badge>` }),
};
export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => ({ props: args, template: `<ds-badge [variant]="variant">Warning</ds-badge>` }),
};
export const Danger: Story = {
  args: { variant: 'danger' },
  render: (args) => ({ props: args, template: `<ds-badge [variant]="variant">Danger</ds-badge>` }),
};
export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => ({ props: args, template: `<ds-badge [variant]="variant">Info</ds-badge>` }),
};
