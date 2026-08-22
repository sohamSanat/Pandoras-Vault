<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { 
        studyHubStore, 
        buyVoucher, 
        redeemVoucher, 
        createCustomVoucher, 
        deleteCustomVoucher 
    } from '../../store';
    import { 
        ShoppingBag, 
        Coins, 
        Package, 
        Plus, 
        Check, 
        Trash2, 
        Gamepad2, 
        Pizza, 
        Film, 
        Moon, 
        Coffee, 
        Gift,
        Clock
    } from 'lucide-svelte';

    const dispatch = createEventDispatcher();

    let activeTab: 'shop' | 'inventory' = 'shop';
    let showAddModal = false;

    // Custom Voucher Form state
    let customTitle = '';
    let customCost = 300;
    let customDesc = '';
    let customIcon = 'Gift';

    $: rpg = $studyHubStore.rpg || { coins: 0, vouchers: [], inventory: [] };
    $: coins = rpg.coins || 0;
    $: vouchers = rpg.vouchers || [];
    $: inventory = rpg.inventory || [];

    function handleCreateCustom() {
        if (!customTitle.trim()) return;
        createCustomVoucher(customTitle, customCost, customIcon, customDesc);
        customTitle = '';
        customDesc = '';
        customCost = 300;
        showAddModal = false;
    }

    function getIconComponent(iconName: string) {
        switch (iconName) {
            case 'Gamepad2': return Gamepad2;
            case 'Pizza': return Pizza;
            case 'Film': return Film;
            case 'Moon': return Moon;
            case 'Coffee': return Coffee;
            default: return Gift;
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-container" on:click|stopPropagation>
        <!-- Modal Header -->
        <div class="modal-header">
            <div class="header-title-box">
                <ShoppingBag size={20} color="#ffd700" />
                <h2>Gold Coin Voucher Shop</h2>
            </div>

            <!-- Currency Purse -->
            <div class="purse-pill">
                <Coins size={16} color="#ffd700" />
                <span class="purse-amount">{coins}</span>
                <span class="purse-label">Coins</span>
            </div>

            <button type="button" class="close-btn" on:click={() => dispatch('close')}>&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="shop-tabs">
            <button 
                type="button" 
                class="tab-btn {activeTab === 'shop' ? 'active' : ''}" 
                on:click={() => activeTab = 'shop'}
            >
                <ShoppingBag size={14} /> Rewards Store ({vouchers.length})
            </button>
            <button 
                type="button" 
                class="tab-btn {activeTab === 'inventory' ? 'active' : ''}" 
                on:click={() => activeTab = 'inventory'}
            >
                <Package size={14} /> My Inventory ({inventory.filter(i => !i.isEnjoyed).length} Unused)
            </button>

            <button 
                type="button" 
                class="add-custom-btn" 
                on:click={() => showAddModal = !showAddModal}
            >
                <Plus size={14} /> Add Custom Reward
            </button>
        </div>

        <!-- Add Custom Voucher Inline Drawer -->
        {#if showAddModal}
            <div class="custom-voucher-form">
                <h4>Create Custom Real-Life Reward</h4>
                <div class="form-grid">
                    <input 
                        type="text" 
                        placeholder="Reward Title (e.g. 2 Hours of Apex Legends)" 
                        bind:value={customTitle} 
                    />
                    <input 
                        type="number" 
                        placeholder="Cost in Coins" 
                        bind:value={customCost} 
                        min="50" 
                        step="50" 
                    />
                    <input 
                        type="text" 
                        placeholder="Description (Optional)" 
                        bind:value={customDesc} 
                    />
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel" on:click={() => showAddModal = false}>Cancel</button>
                    <button type="button" class="btn-save" on:click={handleCreateCustom}>Add to Store</button>
                </div>
            </div>
        {/if}

        <!-- Tab Content -->
        <div class="shop-body">
            {#if activeTab === 'shop'}
                <div class="vouchers-grid">
                    {#each vouchers as voucher (voucher.id)}
                        {@const canAfford = coins >= voucher.cost}
                        {@const IconComp = getIconComponent(voucher.icon)}
                        <div class="voucher-card {canAfford ? 'affordable' : 'unaffordable'}">
                            {#if voucher.isCustom}
                                <button 
                                    type="button" 
                                    class="delete-custom-btn" 
                                    on:click={() => deleteCustomVoucher(voucher.id)}
                                    title="Delete custom reward"
                                >
                                    <Trash2 size={13} />
                                </button>
                            {/if}

                            <div class="voucher-icon-wrapper">
                                <svelte:component this={IconComp} size={24} color="#ffd700" />
                            </div>

                            <div class="voucher-info">
                                <h3 class="voucher-title">{voucher.title}</h3>
                                <p class="voucher-desc">{voucher.description}</p>
                            </div>

                            <div class="voucher-footer">
                                <div class="cost-tag">
                                    <Coins size={14} color="#ffd700" />
                                    <span>{voucher.cost}</span>
                                </div>

                                <button 
                                    type="button" 
                                    class="buy-btn"
                                    disabled={!canAfford}
                                    on:click={() => buyVoucher(voucher.id)}
                                >
                                    {canAfford ? 'Buy Voucher' : 'Need More Coins'}
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <!-- Inventory View -->
                {#if inventory.length === 0}
                    <div class="empty-inventory">
                        <Package size={40} color="var(--text-muted)" />
                        <p>No vouchers purchased yet. Earn coins by studying to treat yourself!</p>
                    </div>
                {:else}
                    <div class="inventory-list">
                        {#each inventory as item (item.id)}
                            {@const IconComp = getIconComponent(item.icon)}
                            <div class="inventory-item {item.isEnjoyed ? 'enjoyed' : 'ready'}">
                                <div class="item-left">
                                    <div class="item-icon-box">
                                        <svelte:component this={IconComp} size={20} color="#ffd700" />
                                    </div>
                                    <div class="item-details">
                                        <h4 class="item-title">{item.title}</h4>
                                        <span class="item-date">
                                            <Clock size={12} /> Purchased on {new Date(item.redeemedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div class="item-right">
                                    {#if item.isEnjoyed}
                                        <span class="enjoyed-badge">
                                            <Check size={14} /> Enjoyed
                                        </span>
                                    {:else}
                                        <button 
                                            type="button" 
                                            class="redeem-btn"
                                            on:click={() => redeemVoucher(item.id)}
                                        >
                                            <Check size={14} /> Redeem & Enjoy
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal-container {
        width: 90vw;
        max-width: 860px;
        max-height: 85vh;
        background: #0b0e14;
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .header-title-box {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .header-title-box h2 {
        font-size: 1.15em;
        font-weight: 800;
        color: #fff;
        margin: 0;
    }

    .purse-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 215, 0, 0.12);
        border: 1px solid rgba(255, 215, 0, 0.35);
        padding: 6px 14px;
        border-radius: 20px;
    }

    .purse-amount {
        font-weight: 800;
        color: #ffd700;
        font-size: 1.05em;
    }

    .purse-label {
        font-size: 0.75em;
        color: var(--text-muted);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.4em;
        cursor: pointer;
    }

    .close-btn:hover { color: #fff; }

    .shop-tabs {
        display: flex;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .tab-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.82em;
        font-weight: 600;
        cursor: pointer;
    }

    .tab-btn.active {
        background: rgba(255, 215, 0, 0.12);
        border-color: rgba(255, 215, 0, 0.4);
        color: #ffd700;
    }

    .add-custom-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 243, 255, 0.1);
        border: 1px solid rgba(0, 243, 255, 0.3);
        color: #00f3ff;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.8em;
        font-weight: 600;
        cursor: pointer;
    }

    .custom-voucher-form {
        background: rgba(0, 243, 255, 0.05);
        border-bottom: 1px solid rgba(0, 243, 255, 0.2);
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .custom-voucher-form h4 {
        margin: 0;
        font-size: 0.9em;
        color: #00f3ff;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr;
        gap: 8px;
    }

    .form-grid input {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 10px;
        color: #fff;
        font-size: 0.82em;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .btn-cancel {
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        color: var(--text-muted);
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
    }

    .btn-save {
        background: #00f3ff;
        color: #000;
        border: none;
        font-weight: 700;
        padding: 5px 14px;
        border-radius: 6px;
        font-size: 0.78em;
        cursor: pointer;
    }

    .shop-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }

    .vouchers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
    }

    .voucher-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        position: relative;
        transition: all 0.2s ease;
    }

    .voucher-card.affordable:hover {
        border-color: rgba(255, 215, 0, 0.45);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.12);
        transform: translateY(-2px);
    }

    .voucher-card.unaffordable {
        opacity: 0.65;
    }

    .delete-custom-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .delete-custom-btn:hover { color: #ef4444; }

    .voucher-icon-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .voucher-title {
        font-size: 0.95em;
        font-weight: 700;
        color: #fff;
        margin: 0 0 4px 0;
    }

    .voucher-desc {
        font-size: 0.75em;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.4;
    }

    .voucher-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .cost-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 800;
        color: #ffd700;
        font-size: 0.95em;
    }

    .buy-btn {
        background: linear-gradient(135deg, #ffd700, #f59e0b);
        color: #000;
        border: none;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.78em;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .buy-btn:disabled {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-muted);
        cursor: not-allowed;
    }

    .empty-inventory {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px 20px;
        color: var(--text-muted);
        text-align: center;
    }

    .inventory-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .inventory-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        padding: 12px 16px;
    }

    .inventory-item.enjoyed {
        opacity: 0.5;
    }

    .item-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .item-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(255, 215, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .item-title {
        font-size: 0.9em;
        font-weight: 700;
        color: #fff;
        margin: 0 0 2px 0;
    }

    .item-date {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.7em;
        color: var(--text-muted);
    }

    .redeem-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.78em;
        font-weight: 800;
        cursor: pointer;
    }

    .enjoyed-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75em;
        font-weight: 700;
        color: #10b981;
    }
</style>
