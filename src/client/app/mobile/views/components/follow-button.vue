<template>
<button class="mk-follow-button"
	:class="{ wait: wait, active: u.isFollowing || u.hasPendingFollowRequestFromYou }"
	@click="onClick"
	:disabled="wait"
>
	<template v-if="!wait">
		<template v-if="u.hasPendingFollowRequestFromYou">%fa:hourglass-half% %i18n:@request-pending%</template>
		<template v-else-if="u.isFollowing">%fa:minus% %i18n:@following%</template>
		<template v-else-if="!u.isFollowing && u.isLocked">%fa:plus% %i18n:@follow-request%</template>
		<template v-else-if="!u.isFollowing && !u.isLocked">%fa:plus% %i18n:@follow%</template>
	</template>
	<template v-else>%fa:spinner .pulse .fw%</template>
</button>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	props: {
		user: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			u: this.user,
			wait: false,
			connection: null,
			connectionId: null
		};
	},
	mounted() {
		this.connection = (this as any).os.stream.getConnection();
		this.connectionId = (this as any).os.stream.use();

		this.connection.on('follow', this.onFollow);
		this.connection.on('unfollow', this.onUnfollow);
	},
	beforeDestroy() {
		this.connection.off('follow', this.onFollow);
		this.connection.off('unfollow', this.onUnfollow);
		(this as any).os.stream.dispose(this.connectionId);
	},
	methods: {

		onFollow(user) {
			if (user.id == this.u.id) {
				this.u.isFollowing = user.isFollowing;
			}
		},

		onUnfollow(user) {
			if (user.id == this.u.id) {
				this.u.isFollowing = user.isFollowing;
			}
		},

		async onClick() {
			this.wait = true;

			try {
				if (this.u.isFollowing) {
					this.u = await (this as any).api('following/delete', {
						userId: this.u.id
					});
				} else {
					if (this.u.isLocked && this.u.hasPendingFollowRequestFromYou) {
						this.u = await (this as any).api('following/requests/cancel', {
							userId: this.u.id
						});
					} else if (this.u.isLocked) {
						this.u = await (this as any).api('following/create', {
							userId: this.u.id
						});
					} else {
						this.u = await (this as any).api('following/create', {
							userId: this.user.id
						});
					}
				}
			} catch (e) {
				console.error(e);
			} finally {
				this.wait = false;
			}
		}
	}
});
</script>

<style lang="stylus" scoped>
@import '~const.styl'

.mk-follow-button
	display block
	user-select none
	cursor pointer
	padding 0 16px
	margin 0
	min-width 100px
	line-height 36px
	font-size 14px
	font-weight bold
	color $theme-color
	background transparent
	outline none
	border solid 1px $theme-color
	border-radius 36px

	&:hover
		background rgba($theme-color, 0.1)

	&:active
		background rgba($theme-color, 0.2)

	&.active
		color $theme-color-foreground
		background $theme-color

		&:hover
			background lighten($theme-color, 10%)
			border-color lighten($theme-color, 10%)

		&:active
			background darken($theme-color, 10%)
			border-color darken($theme-color, 10%)

	&.wait
		cursor wait !important
		opacity 0.7

	*
		pointer-events none

</style>
