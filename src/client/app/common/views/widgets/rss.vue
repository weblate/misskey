<template>
<div class="mkw-rss">
	<mk-widget-container :show-header="!props.compact">
		<template slot="header">%fa:rss-square%RSS</template>
		<button slot="func" title="設定" @click="setting">%fa:cog%</button>

		<div class="mkw-rss--body" :data-mobile="platform == 'mobile'">
			<p class="fetching" v-if="fetching">%fa:spinner .pulse .fw%%i18n:common.loading%<mk-ellipsis/></p>
			<div class="feed" v-else>
				<a v-for="item in items" :href="item.link" target="_blank">{{ item.title }}</a>
			</div>
		</div>
	</mk-widget-container>
</div>
</template>

<script lang="ts">
import define from '../../../common/define-widget';
export default define({
	name: 'rss',
	props: () => ({
		compact: false,
		url: 'http://news.yahoo.co.jp/pickup/rss.xml'
	})
}).extend({
	data() {
		return {
			items: [],
			fetching: true,
			clock: null
		};
	},
	mounted() {
		this.fetch();
		this.clock = setInterval(this.fetch, 60000);
	},
	beforeDestroy() {
		clearInterval(this.clock);
	},
	methods: {
		func() {
			this.props.compact = !this.props.compact;
			this.save();
		},
		fetch() {
			fetch(`https://api.rss2json.com/v1/api.json?rss_url=${this.props.url}`, {
				cache: 'no-cache'
			}).then(res => {
				res.json().then(feed => {
					this.items = feed.items;
					this.fetching = false;
				});
			});
		},
		setting() {
			const url = window.prompt('URL', this.props.url);
			if (url && url != '') {
				this.props.url = url;
				this.save();
				this.fetch();
			}
		}
	}
});
</script>

<style lang="stylus" scoped>
root(isDark)
	.mkw-rss--body
		.feed
			padding 12px 16px
			font-size 0.9em

			> a
				display block
				padding 4px 0
				color isDark ? #9aa4b3 : #666
				border-bottom dashed 1px isDark ? #1c2023 : #eee

				&:last-child
					border-bottom none

		.fetching
			margin 0
			padding 16px
			text-align center
			color #aaa

			> [data-fa]
				margin-right 4px

		&[data-mobile]
			background isDark ? #21242f : #f3f3f3

			.feed
				padding 0

				> a
					padding 8px 16px
					border-bottom none

					&:nth-child(even)
						background isDark ? rgba(#000, 0.05) : rgba(#fff, 0.7)

.mkw-rss[data-darkmode]
	root(true)

.mkw-rss:not([data-darkmode])
	root(false)

</style>
