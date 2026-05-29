import type { Meta, StoryObj } from '@storybook/angular';
import { FocusTrapComponent } from './focus-trap.component';

const meta: Meta<FocusTrapComponent> = {
  title: 'Design System/Primitives/FocusTrap',
  component: FocusTrapComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<FocusTrapComponent>;

export const Enabled: Story = {
  args: { enabled: true },
  render: (args) => ({
    props: args,
    template: `
      <ds-focus-trap [enabled]="enabled" style="padding: 1rem; border: 2px solid #374151; border-radius: 8px; display: inline-block">
        <p style="color: white; margin: 0 0 0.5rem">Tab stays inside this region</p>
        <button style="margin-right: 8px">First</button>
        <button>Second</button>
      </ds-focus-trap>
    `,
  }),
};

export const Disabled: Story = {
  args: { enabled: false },
  render: (args) => ({
    props: args,
    template: `
      <ds-focus-trap [enabled]="enabled" style="padding: 1rem; border: 2px solid #374151; border-radius: 8px; display: inline-block">
        <p style="color: white; margin: 0 0 0.5rem">Tab is not trapped here</p>
        <button style="margin-right: 8px">First</button>
        <button>Second</button>
      </ds-focus-trap>
    `,
  }),
};
